import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsSeqId1757924469285 implements MigrationInterface {
  name = 'CreatePostsSeqId1757924469285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. seq 컬럼을 nullable로 먼저 추가
    await queryRunner.query(`ALTER TABLE "posts" ADD "seq" integer`);

    // 2. 기존 데이터에 seq 값 할당 (schedule별로 순서 부여)
    await queryRunner.query(`
            WITH ranked_posts AS (
                SELECT 
                    id,
                    ROW_NUMBER() OVER (PARTITION BY schedule_id ORDER BY id) as rn
                FROM posts
            )
            UPDATE posts 
            SET seq = ranked_posts.rn 
            FROM ranked_posts 
            WHERE posts.id = ranked_posts.id
        `);

    // 3. seq 컬럼을 NOT NULL로 변경
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "seq" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "seq"`);
  }
}
