// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

module.exports = {
  WARN_AFTER_BUNDLE_GZIP_SIZE,
  WARN_AFTER_CHUNK_GZIP_SIZE,
};
