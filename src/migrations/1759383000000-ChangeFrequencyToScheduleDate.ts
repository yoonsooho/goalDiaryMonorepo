import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFrequencyToScheduleDate1759383000000
  implements MigrationInterface
{
  name = 'ChangeFrequencyToScheduleDate1759383000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // frequency 컬럼을 schedule_date로 변경
    await queryRunner.query(`
      ALTER TABLE "routines" 
      DROP COLUMN "frequency"
    `);

    await queryRunner.query(`
      ALTER TABLE "routines" 
      ADD COLUMN "schedule_date" date
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // rollback: schedule_date를 frequency로 되돌리기
    await queryRunner.query(`
      ALTER TABLE "routines" 
      DROP COLUMN "schedule_date"
    `);

    await queryRunner.query(`
      ALTER TABLE "routines" 
      ADD COLUMN "frequency" character varying NOT NULL DEFAULT 'daily'
    `);
  }
}
