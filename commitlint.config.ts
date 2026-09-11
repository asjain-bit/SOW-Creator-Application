const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0],
    'body-max-line-length': [0],
  },
}

export default Configuration
