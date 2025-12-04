import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveJoinColumn1759297025288 implements MigrationInterface {
    name = 'RemoveJoinColumn1759297025288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81"`);
        await queryRunner.query(`ALTER TABLE "content_items" RENAME COLUMN "post_id" TO "postId"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "schedule_id" TO "scheduleId"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_06e30d541385c44bfba255f1f96" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_8610f1d7b5292522647b45eedd0" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_8610f1d7b5292522647b45eedd0"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_06e30d541385c44bfba255f1f96"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "scheduleId" TO "schedule_id"`);
        await queryRunner.query(`ALTER TABLE "content_items" RENAME COLUMN "postId" TO "post_id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_d3001ed3c1fbe165f9cdaa0eb81" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
