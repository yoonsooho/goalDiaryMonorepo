import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuoteEntity1767603374334 implements MigrationInterface {
  name = 'AddQuoteEntity1767603374334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quotes" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "author" character varying, "link" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_8bad8bd49d1dd6954b46366349c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT "FK_8bad8bd49d1dd6954b46366349c"`,
    );
    await queryRunner.query(`DROP TABLE "quotes"`);
  }
}
