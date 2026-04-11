import { chromeLauncher } from '@web/test-runner-chrome';

export default {
	files: 'src/**/*.test.js',
	browsers: [
		chromeLauncher({
			launchOptions: {
				args: ['--no-sandbox', '--disable-dev-shm-usage'],
			},
		}),
	],
	nodeResolve: true,
};
