import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleUserUpdateEntity1756382072966 implements MigrationInterface {
    name = 'ScheduleUserUpdateEntity1756382072966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_55e6651198104efea0b04568a88"`);
        await queryRunner.query(`CREATE TABLE "schedule_user" ("id" SERIAL NOT NULL, "canEdit" boolean NOT NULL DEFAULT false, "userId" uuid, "scheduleId" integer, CONSTRAINT "PK_c9927b15da3efbbfb7f29928216" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "socialId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "social" character varying`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_f817942c0ae11f095b7b8c8785d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_158eb66d94eb910989f79ee5e4b" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP CONSTRAINT "FK_158eb66d94eb910989f79ee5e4b"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP CONSTRAINT "FK_f817942c0ae11f095b7b8c8785d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "social"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "socialId"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "schedule_user"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_55e6651198104efea0b04568a88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
