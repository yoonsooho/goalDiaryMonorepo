import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameNameToUserId1757316975636 implements MigrationInterface {
    name = 'RenameNameToUserId1757316975636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "name" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "PK_9c6bf4f28851752cee186915e39"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "PK_9c6bf4f28851752cee186915e39" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP COLUMN "post_id"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD "post_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP COLUMN "post_id"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD "post_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "PK_9c6bf4f28851752cee186915e39"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "PK_9c6bf4f28851752cee186915e39" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "userId" TO "name"`);
    }

}
