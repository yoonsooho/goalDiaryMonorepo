import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertCategoryToArray1759571000000 implements MigrationInterface {
  name = 'RevertCategoryToArray1759571000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "category"`);
    await queryRunner.query(`ALTER TABLE "routines" ADD "category" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "category"`);
    await queryRunner.query(
      `ALTER TABLE "routines" ADD "category" character varying(50)`,
    );
  }
}
