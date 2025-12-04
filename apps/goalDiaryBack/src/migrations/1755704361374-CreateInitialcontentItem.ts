import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialcontentItem1755704361374 implements MigrationInterface {
    name = 'CreateInitialcontentItem1755704361374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "content" TO "title"`);
        await queryRunner.query(`CREATE TABLE "content_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "post_id" uuid NOT NULL, CONSTRAINT "PK_9c6bf4f28851752cee186915e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`DROP TABLE "content_items"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME COLUMN "title" TO "content"`);
    }

}
