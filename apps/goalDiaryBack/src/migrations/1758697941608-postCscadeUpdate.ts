import { MigrationInterface, QueryRunner } from "typeorm";

export class PostCscadeUpdate1758697941608 implements MigrationInterface {
    name = 'PostCscadeUpdate1758697941608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
