import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAutoIncrementFromSeq1759302820007
  implements MigrationInterface
{
  name = 'RemoveAutoIncrementFromSeq1759302820007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_items" ALTER COLUMN "seq" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "content_items_seq_seq"`);
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "seq" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "posts_seq_seq"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "posts_seq_seq" OWNED BY "posts"."seq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "seq" SET DEFAULT nextval('"posts_seq_seq"')`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "content_items_seq_seq" OWNED BY "content_items"."seq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_items" ALTER COLUMN "seq" SET DEFAULT nextval('"content_items_seq_seq"')`,
    );
  }
}
