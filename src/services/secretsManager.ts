import AWS from 'aws-sdk';
import config from '../config';
import { AWSSecrets } from '../types';
import logger from '../utils/logger';

export async function getSecrets(): Promise<AWSSecrets | null> {
  try {
    const secretsManager = new AWS.SecretsManager({
      region: config.aws.region,
    });
    
    const data = await secretsManager.getSecretValue({ SecretId: config.aws.secretName }).promise();
    
    if ('SecretString' in data) {
      const secretString = data.SecretString;
      if (secretString) {
        const parsedSecrets = JSON.parse(secretString) as AWSSecrets;
        logger.info('Secrets successfully loaded from AWS Secrets Manager');
        return parsedSecrets;
      }
    } else {
      logger.error('Secret is in binary format which is not supported');
    }
    
    return null;
  } catch (error) {
    logger.error('Error fetching secrets from AWS Secrets Manager:', error);
    
    if (config.nodeEnv === 'development') {
      logger.warn('Using default configuration values for development environment');
      return null;
    }
    
    // throw error;
    return null;
  }
}

export async function updateConfigWithSecrets(): Promise<void> {
  try {
    const secrets = await getSecrets();
    
    if (secrets) {
      // Update configuration with secrets
      config.db.host = secrets.dbHost || config.db.host;
      config.db.port = secrets.dbPort || config.db.port;
      config.db.database = secrets.dbName || config.db.database;
      config.db.user = secrets.dbUser || config.db.user;
      config.db.password = secrets.dbPassword || config.db.password;
      
      config.redis.host = secrets.redisHost || config.redis.host;
      config.redis.port = secrets.redisPort || config.redis.port;
      config.redis.password = secrets.redisPassword || config.redis.password;
      
      config.jwt.secret = secrets.jwtSecret || config.jwt.secret;
      
      logger.info('Configuration updated with secrets from AWS Secrets Manager');
    }
  } catch (error) {
    logger.error('Failed to update configuration with secrets:', error);
    throw error;
  }
} 