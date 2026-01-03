const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let libName = process.env.API_LIB;

if (libName && libName.startsWith('API_LIB=')) {
    libName = libName.replace('API_LIB=', '');
}

if (libName) {
    console.log(`[Dynamic Install] Detected API_LIB="${libName}"`);
    console.log(`[Dynamic Install] Installing library...`);

    try {
        // 1. Install the main library
        execSync(`npm install ${libName} --no-save --no-audit`, { stdio: 'inherit' });
        console.log(`[Dynamic Install] Successfully installed "${libName}"`);

        // 2. Discover Dependencies & Prepare Symlinks
        const packagePath = path.join('node_modules', libName);
        const packagesDir = path.join(packagePath, 'packages');
        const toInstall = new Set();
        const packagesToSymlink = [];

        if (fs.existsSync(packagesDir)) {
            console.log('[Dynamic Install] Monorepo structure detected. Analyzing dependencies...');

            const packages = fs.readdirSync(packagesDir);

            packages.forEach(pkg => {
                const source = path.join(packagesDir, pkg);
                // Queue for symlinking later
                packagesToSymlink.push({ pkg, source });

                // Dependency Discovery
                const pkgJsonPath = path.join(source, 'package.json');
                if (fs.existsSync(pkgJsonPath)) {
                    try {
                        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                        if (pkgJson.dependencies) {
                            Object.keys(pkgJson.dependencies).forEach(dep => {
                                // Ignore internal dependencies (starting with @enode-restaurant)
                                if (!dep.startsWith('@enode-restaurant')) {
                                    // Add to install list with version if specified
                                    toInstall.add(`${dep}@${pkgJson.dependencies[dep]}`);
                                }
                            });
                        }
                    } catch (e) {
                        // ignore invalid json
                    }
                }
            });

            // 3. Install Discovered Dependencies (include libName to prevent pruning)
            if (toInstall.size > 0) {
                console.log(`[Dynamic Install] Installing ${toInstall.size} internal dependencies + main library to prevent pruning...`);
                const installCmd = `npm install ${libName} ${Array.from(toInstall).join(' ')} --no-save --no-audit`;
                execSync(installCmd, { stdio: 'inherit' });
            }

            // 4. Create Symlinks (MUST be done after npm install)
            console.log('[Dynamic Install] Creating symlinks...');
            const targetDir = path.join('node_modules', '@enode-restaurant');

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            packagesToSymlink.forEach(({ pkg, source }) => {
                const dest = path.join(targetDir, pkg);
                if (fs.existsSync(source)) {
                    // Calculate relative path from dest folder to source
                    const relativeSource = path.relative(targetDir, source);
                    try {
                        if (fs.existsSync(dest)) fs.unlinkSync(dest);
                        fs.symlinkSync(relativeSource, dest, 'dir');
                    } catch (e) {
                        console.warn(`Warning: Failed to symlink ${pkg}: ${e.message}`);
                    }
                }
            });
            console.log('[Dynamic Install] Symlinks created.');
        }

    } catch (error) {
        console.error(`[Dynamic Install] Failed to set up "${libName}"`);
        console.error(error);
        process.exit(1);
    }
} else {
    console.log('[Dynamic Install] API_LIB environment variable not set. Skipping dynamic installation.');
}
