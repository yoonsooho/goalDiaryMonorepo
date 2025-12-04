import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';

const config = {
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: `${process.env.DB_HOST || 'localhost'}`,
        port: parseInt(`${process.env.DB_PORT || '5432'}`, 10),
        username: `${process.env.DB_USERNAME || 'test'}`,
        password: `${process.env.DB_PASSWORD || 'test'}`,
        database: `${process.env.DB_DATABASE || 'todoDndBack'}`,
      }),
  entities: ['dist/**/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
