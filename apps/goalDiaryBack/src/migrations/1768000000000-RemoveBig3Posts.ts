import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBig3Posts1768000000000 implements MigrationInterface {
  name = 'RemoveBig3Posts1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // title이 'BIG3일정'인 기존 포스트 전체 삭제
    await queryRunner.query(`DELETE FROM "posts" WHERE "title" = 'BIG3일정'`);
  }

    public async down(_queryRunner: QueryRunner): Promise<void> {
    // 데이터 복구가 불가능하므로 down에서는 아무것도 하지 않습니다.
    // 필요하다면 별도의 seed나 백업을 통해 복원해야 합니다.
  }
}
