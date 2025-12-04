import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostIdAndScheduleIdChange1758760893490
  implements MigrationInterface
{
  name = 'PostIdAndScheduleIdChange1758760893490';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 모든 관련 테이블 삭제 (데이터 손실 주의!)
    await queryRunner.query(`DROP TABLE IF EXISTS "content_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schedule_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schedules"`);

    // schedules 테이블 재생성
    await queryRunner.query(`CREATE TABLE "schedules" (
        "id" character varying NOT NULL,
        "title" character varying(255) NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schedules" PRIMARY KEY ("id")
    )`);

    // posts 테이블 재생성
    await queryRunner.query(`CREATE TABLE "posts" (
        "id" character varying NOT NULL,
        "seq" integer NOT NULL,
        "title" character varying(255) NOT NULL,
        "schedule_id" character varying NOT NULL,
        CONSTRAINT "PK_posts" PRIMARY KEY ("id")
    )`);

    // schedule_user 테이블 재생성
    await queryRunner.query(`CREATE TABLE "schedule_user" (
        "id" SERIAL NOT NULL,
        "canEdit" boolean NOT NULL DEFAULT false,
        "scheduleId" character varying,
        "userId" character varying,
        CONSTRAINT "PK_schedule_user" PRIMARY KEY ("id")
    )`);

    // content_items 테이블 재생성
    await queryRunner.query(`CREATE TABLE "content_items" (
        "id" SERIAL NOT NULL,
        "text" text NOT NULL,
        "seq" integer NOT NULL,
        "post_id" character varying NOT NULL,
        CONSTRAINT "PK_content_items" PRIMARY KEY ("id")
    )`);

    // 외래키 제약조건 추가
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_schedule_user_schedule" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_items" ADD CONSTRAINT "FK_content_items_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 모든 테이블 삭제
    await queryRunner.query(`DROP TABLE IF EXISTS "content_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schedule_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schedules"`);

    // 원래 구조로 복원 (number 타입)
    await queryRunner.query(`CREATE TABLE "schedules" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schedules" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "posts" (
        "id" SERIAL NOT NULL,
        "seq" integer NOT NULL,
        "title" character varying(255) NOT NULL,
        "schedule_id" integer NOT NULL,
        CONSTRAINT "PK_posts" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "schedule_user" (
        "id" SERIAL NOT NULL,
        "canEdit" boolean NOT NULL DEFAULT false,
        "scheduleId" integer,
        "userId" character varying,
        CONSTRAINT "PK_schedule_user" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "content_items" (
        "id" SERIAL NOT NULL,
        "text" text NOT NULL,
        "seq" integer NOT NULL,
        "post_id" integer NOT NULL,
        CONSTRAINT "PK_content_items" PRIMARY KEY ("id")
    )`);

    // 외래키 제약조건 추가
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_schedule_user_schedule" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_items" ADD CONSTRAINT "FK_content_items_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
