import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// 단순화: JWT 페이로드 타입
type JwtPayload = { sub: string; userId?: string; id?: string };

/**
 * WebSocket Gateway
 * @WebSocketGateway 데코레이터로 WebSocket 서버를 생성
 * - namespace: '/schedules' - 클라이언트는 io(`${url}/schedules`)로 연결
 * - cors: { origin: '*' } - 모든 origin에서 연결 허용
 *
 * OnGatewayConnection 인터페이스를 구현하면:
 * - 클라이언트가 WebSocket으로 연결할 때마다 handleConnection()이 자동으로 호출됨
 * - NestJS가 내부적으로 Socket.IO의 connection 이벤트를 감지하여 handleConnection()을 호출
 * - 명시적으로 호출하는 코드는 없음 (NestJS 프레임워크가 자동 처리)
 */
@WebSocketGateway({
  namespace: '/schedules',
  cors: { origin: '*' },
})
export class ScheduleGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * WebSocket 연결 시 자동으로 호출되는 메서드
   *
   * 호출 시점:
   * - 클라이언트가 io(`${url}/schedules`)로 연결할 때
   * - NestJS가 OnGatewayConnection 인터페이스를 감지하여 자동 호출
   * - Socket.IO의 connection 이벤트가 발생하면 NestJS가 이 메서드를 호출
   *
   * @param client - 연결된 클라이언트의 Socket 인스턴스 (Socket.IO에서 제공)
   *                 각 클라이언트마다 고유한 Socket 객체가 생성됨
   *                 - client.id: 고유한 소켓 ID
   *                 - client.handshake: 연결 시 전달된 정보 (headers, auth, query 등)
   *                 - client.join(room): 특정 room에 참여
   *                 - client.emit(event, data): 해당 클라이언트에게 이벤트 전송
   *                 - client.disconnect(): 연결 종료
   */
  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          this.configService.get<string>('JWT_SECRET') ||
          'default_secret',
      });
      // 사용자 id를 소켓에 저장 (나중에 사용자 식별에 사용)
      (client as any).userId = payload?.sub || payload?.userId || payload?.id;
    } catch (e) {
      client.disconnect(true);
    }
  }

  /**
   * 클라이언트로부터 토큰을 추출하는 메서드
   * @param client - Socket 인스턴스
   * @returns JWT 토큰 또는 null
   */
  private extractToken(client: Socket): string | null {
    // 1. Authorization 헤더에서 확인
    // client.handshake.headers: WebSocket 연결 시 HTTP 요청의 헤더들이 자동으로 포함됨
    // 브라우저가 자동으로 보내는 헤더들:
    // - host, user-agent, accept, accept-language, accept-encoding, connection, upgrade 등
    // - 만약 프론트엔드에서 명시적으로 Authorization 헤더를 설정했다면 여기에 포함됨
    //   (하지만 Socket.IO 클라이언트에서는 일반적으로 auth 옵션을 사용)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [, token] = authHeader.split(' ');
      if (token) return token;
    }
    // 2. handshake.auth에서 확인 (Socket.IO auth 옵션)
    // 프론트엔드에서 io(url, { auth: { token } })로 전송한 값
    // 이 방법이 Socket.IO에서 권장하는 인증 방식
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') return authToken;
    // 3. query parameter에서 확인
    // URL에 ?token=xxx 형태로 전달된 경우
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') return queryToken;
    return null;
  }

  /**
   * 클라이언트가 특정 스케줄 room에 참여할 때 호출
   * @param client - 요청한 클라이언트의 Socket 인스턴스
   * @param data - 클라이언트가 전송한 데이터 (scheduleId 포함)
   */
  @SubscribeMessage('joinSchedule')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { scheduleId: number },
  ) {
    if (!data?.scheduleId) return;
    // TODO: 권한 체크 (schedule 참여자/팀 멤버 확인)
    // client.join(): 해당 클라이언트를 특정 room에 추가
    // 이후 this.server.to(`schedule:${scheduleId}`).emit()로 해당 room의 모든 클라이언트에게 브로드캐스트 가능
    client.join(`schedule:${data.scheduleId}`);
  }

  // 스케줄 변경 브로드캐스트용 헬퍼
  emitScheduleUpdated(scheduleId: number, payload: any) {
    this.server.to(`schedule:${scheduleId}`).emit('schedule.updated', payload);
  }
}
