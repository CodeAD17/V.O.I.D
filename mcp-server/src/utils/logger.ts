
import chalk from 'chalk';

const getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 8);

export const logger = {
    info: (msg: string, ...args: any[]) => {
        console.log(chalk.blue(`[${getTimestamp()}] ℹ  ${msg}`), ...args);
    },
    success: (msg: string, ...args: any[]) => {
        console.log(chalk.green(`[${getTimestamp()}] ✅ ${msg}`), ...args);
    },
    warn: (msg: string, ...args: any[]) => {
        console.log(chalk.yellow(`[${getTimestamp()}] ⚠  ${msg}`), ...args);
    },
    error: (msg: string, ...args: any[]) => {
        console.error(chalk.red(`[${getTimestamp()}] ❌ ${msg}`), ...args);
    },
    agent: (name: string, msg: string, ...args: any[]) => {
        console.log(chalk.magenta(`[${getTimestamp()}] 🤖 [${name}] ${msg}`), ...args);
    },
    request: (method: string, url: string) => {
        console.log(chalk.gray(`[${getTimestamp()}] 📡 ${method} ${url}`));
    }
};
