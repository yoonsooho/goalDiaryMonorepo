import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBigRankToContentItems1770000000001 implements MigrationInterface {
  name = 'AddBigRankToContentItems1770000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_items" ADD "bigRank" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_items" DROP COLUMN "bigRank"`,
    );
  }
}
