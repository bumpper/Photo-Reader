/**
 * Platform Detection and Configuration Utilities
 * For Photo-Reader Tauri Application
 * 
 * Provides cross-platform detection and configuration for:
 * - Windows (MSI, NSIS)
 * - macOS (DMG, APP)
 * - Linux Ubuntu/Debian (DEB, AppImage)
 * - Linux Fedora/RHEL (RPM)
 */

const os = require('os');

/**
 * Get the current platform
 * @returns {string} 'windows', 'darwin', or 'linux'
 */
function getPlatform() {
    return os.platform();
}

/**
 * Get detailed platform information
 * @returns {object} Platform details
 */
function getPlatformInfo() {
    const platform = getPlatform();
    const arch = os.arch();
    const release = os.release();
    
    return {
        platform,
        arch,
        release,
        isWindows: platform === 'win32',
        isMac: platform === 'darwin',
        isLinux: platform === 'linux'
    };
}

/**
 * Get platform-specific configuration
 * @returns {object} Configuration for current platform
 */
function getPlatformConfig() {
    const info = getPlatformInfo();
    
    const configs = {
        win32: {
            name: 'Windows',
            devCommand: 'tauri dev',
            buildCommand: 'tauri build',
            buildTargets: ['msi', 'nsis'],
            bundleFormats: ['msi', 'nsis'],
            executableExt: '.exe',
            scriptExt: '.bat',
            pathSeparator: '\\',
            outputDir: 'src-tauri\\target\\release\\bundle',
            installerPaths: [
                'msi\\Photo-Reader_1.0.0_x64_en-US.msi',
                'nsis\\Photo-Reader_1.0.0_x64-setup.exe'
            ]
        },
        darwin: {
            name: 'macOS',
            devCommand: 'tauri dev',
            buildCommand: 'tauri build',
            buildTargets: ['dmg', 'app'],
            bundleFormats: ['dmg', 'app'],
            executableExt: '',
            scriptExt: '.sh',
            pathSeparator: '/',
            outputDir: 'src-tauri/target/release/bundle',
            installerPaths: [
                'dmg/Photo-Reader_1.0.0_x64.dmg',
                'macos/Photo-Reader.app'
            ]
        },
        linux: {
            name: 'Linux',
            devCommand: 'tauri dev',
            buildCommand: 'tauri build',
            buildTargets: ['deb', 'appimage', 'rpm'],
            bundleFormats: ['deb', 'appimage', 'rpm'],
            executableExt: '',
            scriptExt: '.sh',
            pathSeparator: '/',
            outputDir: 'src-tauri/target/release/bundle',
            installerPaths: [
                'deb/photo-reader_1.0.0_amd64.deb',
                'appimage/photo-reader_1.0.0_amd64.AppImage',
                'rpm/photo-reader-1.0.0-1.x86_64.rpm'
            ]
        }
    };
    
    return configs[info.platform] || configs.linux;
}

/**
 * Get build targets for current platform
 * @returns {array} Array of build target strings
 */
function getBuildTargets() {
    const config = getPlatformConfig();
    return config.buildTargets;
}

/**
 * Get the appropriate dev command for current platform
 * @returns {string} Development command
 */
function getDevCommand() {
    const config = getPlatformConfig();
    return config.devCommand;
}

/**
 * Get the appropriate build command for current platform
 * @param {string} specificTarget - Optional specific target (e.g., 'deb', 'rpm')
 * @returns {string} Build command
 */
function getBuildCommand(specificTarget = null) {
    const config = getPlatformConfig();
    
    if (specificTarget) {
        return `${config.buildCommand} --bundles ${specificTarget}`;
    }
    
    return config.buildCommand;
}

/**
 * Detect Linux distribution
 * @returns {string} 'ubuntu', 'debian', 'fedora', 'rhel', or 'unknown'
 */
function getLinuxDistro() {
    if (!getPlatformInfo().isLinux) {
        return 'not-linux';
    }
    
    try {
        const fs = require('fs');
        
        // Check /etc/os-release
        if (fs.existsSync('/etc/os-release')) {
            const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
            
            if (osRelease.includes('Ubuntu')) return 'ubuntu';
            if (osRelease.includes('Debian')) return 'debian';
            if (osRelease.includes('Fedora')) return 'fedora';
            if (osRelease.includes('Red Hat') || osRelease.includes('RHEL')) return 'rhel';
            if (osRelease.includes('CentOS')) return 'centos';
        }
        
        // Check /etc/redhat-release
        if (fs.existsSync('/etc/redhat-release')) {
            return 'fedora'; // Fedora/RHEL/CentOS
        }
        
        // Check /etc/debian_version
        if (fs.existsSync('/etc/debian_version')) {
            return 'debian'; // Debian/Ubuntu
        }
    } catch (error) {
        console.warn('Could not detect Linux distribution:', error.message);
    }
    
    return 'unknown';
}

/**
 * Get recommended build command for Linux distribution
 * @returns {string} Recommended build command
 */
function getLinuxBuildCommand() {
    const distro = getLinuxDistro();
    
    const commands = {
        ubuntu: 'npm run build:linux-deb',
        debian: 'npm run build:linux-deb',
        fedora: 'npm run build:linux-rpm',
        rhel: 'npm run build:linux-rpm',
        centos: 'npm run build:linux-rpm',
        unknown: 'npm run build'
    };
    
    return commands[distro] || commands.unknown;
}

/**
 * Display platform information
 */
function displayPlatformInfo() {
    const info = getPlatformInfo();
    const config = getPlatformConfig();
    
    console.log('\n=== Platform Information ===');
    console.log(`Platform: ${config.name}`);
    console.log(`Architecture: ${info.arch}`);
    console.log(`OS Release: ${info.release}`);
    
    if (info.isLinux) {
        console.log(`Linux Distribution: ${getLinuxDistro()}`);
    }
    
    console.log(`\nBuild Targets: ${config.buildTargets.join(', ')}`);
    console.log(`Output Directory: ${config.outputDir}`);
    console.log('===========================\n');
}

/**
 * Validate platform requirements
 * @returns {object} Validation result with status and messages
 */
function validatePlatform() {
    const info = getPlatformInfo();
    const issues = [];
    const warnings = [];
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (nodeMajor < 16) {
        issues.push(`Node.js version ${nodeVersion} is too old. Requires v16 or later.`);
    }
    
    // Platform-specific checks
    if (info.isWindows) {
        warnings.push('Ensure Visual Studio Build Tools are installed');
        warnings.push('Ensure WebView2 is installed (pre-installed on Windows 10/11)');
    } else if (info.isMac) {
        warnings.push('Ensure Xcode Command Line Tools are installed: xcode-select --install');
    } else if (info.isLinux) {
        warnings.push('Ensure webkit2gtk and build dependencies are installed');
        const distro = getLinuxDistro();
        if (distro === 'unknown') {
            warnings.push('Could not detect Linux distribution. Manual dependency installation may be required.');
        }
    }
    
    return {
        valid: issues.length === 0,
        issues,
        warnings
    };
}

module.exports = {
    getPlatform,
    getPlatformInfo,
    getPlatformConfig,
    getBuildTargets,
    getDevCommand,
    getBuildCommand,
    getLinuxDistro,
    getLinuxBuildCommand,
    displayPlatformInfo,
    validatePlatform
};
