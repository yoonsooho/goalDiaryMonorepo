import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertScheduleIdToNumber1758761168830 implements MigrationInterface {
    name = 'RevertScheduleIdToNumber1758761168830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_content_items_post"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_schedule"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP CONSTRAINT "FK_schedule_user_schedule"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "schedule_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "schedule_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "PK_schedules"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP COLUMN "scheduleId"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD "scheduleId" integer`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_f817942c0ae11f095b7b8c8785d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_158eb66d94eb910989f79ee5e4b" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP CONSTRAINT "FK_158eb66d94eb910989f79ee5e4b"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP CONSTRAINT "FK_f817942c0ae11f095b7b8c8785d"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP COLUMN "scheduleId"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD "scheduleId" character varying`);
        await queryRunner.query(`ALTER TABLE "schedule_user" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD "userId" character varying`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "PK_schedules" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "schedule_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "schedule_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule_user" ADD CONSTRAINT "FK_schedule_user_schedule" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_content_items_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
