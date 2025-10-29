import { z } from 'zod';
import generatedConfigData from './generated-config.json';

// 运行时优先使用环境变量
const getRuntimeConfig = () => {
  const baseUrl = process.env.UPTIME_KUMA_BASE_URL || generatedConfigData.baseUrl;
  const pageId = process.env.PAGE_ID || generatedConfigData.pageId;
  
  if (process.env.UPTIME_KUMA_BASE_URL || process.env.PAGE_ID) {
    console.log('[config] Using runtime environment variables');
    console.log('[config] baseUrl:', baseUrl);
    console.log('[config] pageId:', pageId);
  }
  
  const pageIds = pageId.split(/[,\s]+/).filter(id => id.trim());
  
  return {
    ...generatedConfigData,
    baseUrl,
    pageId: pageIds[0],
    pageIds,
    pages: pageIds.map(id => ({
      id,
      siteMeta: generatedConfigData.siteMeta,
    })),
  };
};

const generatedConfig = getRuntimeConfig();

// 验证生成的配置
const siteMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  iconCandidates: z.array(z.string()).min(1),
});

const configSchema = z.object({
  baseUrl: z.string().url(),
  pageId: z.string(),
  pageIds: z.array(z.string()).min(1),
  pages: z.array(
    z.object({
      id: z.string(),
      siteMeta: siteMetaSchema,
    }),
  ),
  siteMeta: siteMetaSchema,
  isPlaceholder: z.boolean(),
  isEditThisPage: z.boolean(),
  isShowStarButton: z.boolean(),
});

// 优先使用环境变量，如果没有则使用配置文件
const getEnvConfig = () => {
  // 尝试从环境变量读取
  const envBaseUrl = process.env.UPTIME_KUMA_BASE_URL;
  const envPageId = process.env.PAGE_ID;
  
  if (envBaseUrl && envPageId) {
    console.log('[config] Using environment variables for configuration');
    const pageIds = envPageId.split(/[,\s]+/).filter(id => id.trim());
    
    return {
      ...generatedConfig,
      baseUrl: envBaseUrl,
      pageId: pageIds[0],
      pageIds,
      pages: pageIds.map(id => ({
        id,
        siteMeta: generatedConfig.siteMeta,
      })),
    };
  }
  
  // 否则使用配置文件
  return generatedConfig;
};

// 确保配置符合schema
const config = configSchema.parse(getEnvConfig());

// 仅包含运行时环境变量
const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// 完整环境配置
export const env = {
  // 从配置文件获取的数据
  config: {
    ...config,
  },

  // 运行时环境变量
  runtime: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
};

// 导出类型
export type Env = typeof env;
