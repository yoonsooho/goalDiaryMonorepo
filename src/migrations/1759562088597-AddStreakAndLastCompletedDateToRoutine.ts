import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreakAndLastCompletedDateToRoutine1759562088597
  implements MigrationInterface
{
  name = 'AddStreakAndLastCompletedDateToRoutine1759562088597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStreak = await queryRunner.hasColumn('routines', 'streak');
    if (!hasStreak) {
      await queryRunner.query(
        `ALTER TABLE "routines" ADD "streak" integer NOT NULL DEFAULT '0'`,
      );
    }

    const hasLastCompletedDate = await queryRunner.hasColumn(
      'routines',
      'last_completed_date',
    );
    if (!hasLastCompletedDate) {
      await queryRunner.query(
        `ALTER TABLE "routines" ADD "last_completed_date" date`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "routines" DROP COLUMN "last_completed_date"`,
    );
    await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "streak"`);
  }
}
