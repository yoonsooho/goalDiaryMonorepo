import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartEndTimeToContentItems1763630437212
  implements MigrationInterface
{
  name = 'AddStartEndTimeToContentItems1763630437212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "content_items" ADD "startTime" TIME`);
    await queryRunner.query(`ALTER TABLE "content_items" ADD "endTime" TIME`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_items" DROP COLUMN "endTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_items" DROP COLUMN "startTime"`,
    );
  }
}
