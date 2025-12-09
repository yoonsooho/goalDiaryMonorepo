import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsCompletedToContentItem1765158140709 implements MigrationInterface {
    name = 'AddIsCompletedToContentItem1765158140709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" ADD "isCompleted" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP COLUMN "isCompleted"`);
    }

}
