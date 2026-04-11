import { chromeLauncher } from '@web/test-runner-chrome';

export default {
	files: ['src/**/*.test.js', '*.test.js'],
	browsers: [chromeLauncher()],
	nodeResolve: true,
	concurrency: 1,
};
