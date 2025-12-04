import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeqToContentItems1758024495278 implements MigrationInterface {
  name = 'AddSeqToContentItems1758024495278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. seq 컬럼을 nullable로 먼저 추가
    await queryRunner.query(`ALTER TABLE "content_items" ADD "seq" integer`);

    // 2. 기존 데이터에 seq 값 할당 (post별로 순서 부여)
    await queryRunner.query(`
      WITH ranked_content_items AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY id) as rn
        FROM content_items
      )
      UPDATE content_items 
      SET seq = ranked_content_items.rn 
      FROM ranked_content_items 
      WHERE content_items.id = ranked_content_items.id
    `);

    // 3. seq 컬럼을 NOT NULL로 변경
    await queryRunner.query(
      `ALTER TABLE "content_items" ALTER COLUMN "seq" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "content_items" DROP COLUMN "seq"`);
  }
}
