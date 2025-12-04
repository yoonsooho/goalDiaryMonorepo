import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDuplicateUserIdColumn1759554410074
  implements MigrationInterface
{
  name = 'RemoveDuplicateUserIdColumn1759554410074';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('routines', 'user_id');
    if (hasColumn) {
      await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "user_id"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "routines" ADD "user_id" uuid NOT NULL`,
    );
  }
}
