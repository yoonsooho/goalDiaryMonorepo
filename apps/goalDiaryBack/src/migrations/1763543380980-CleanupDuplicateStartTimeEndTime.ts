import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupDuplicateStartTimeEndTime1763543380980 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 컬럼이 이미 존재하는지 확인하고, 없을 때만 추가
    const table = await queryRunner.getTable('posts');
    const hasStartTime = table?.findColumnByName('startTime');
    const hasEndTime = table?.findColumnByName('endTime');

    if (!hasStartTime) {
      await queryRunner.query(`ALTER TABLE "posts" ADD "startTime" TIME`);
    }
    if (!hasEndTime) {
      await queryRunner.query(`ALTER TABLE "posts" ADD "endTime" TIME`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백 시 컬럼 제거 (필요한 경우)
    // await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "endTime"`);
    // await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "startTime"`);
  }
}
