import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeScheduleID1755788316514 implements MigrationInterface {
    name = 'ChangeScheduleID1755788316514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "schedule_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "schedule_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "schedule_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "schedule_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
