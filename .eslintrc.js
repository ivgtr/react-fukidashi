module.exports = {
  extends: [
    "eslint-config-sumikko",
    "eslint-config-sumikko/ts",
    "eslint-config-sumikko/react",
    "eslint-config-sumikko/prettier",
  ],
  rules: {
    "node/no-unpublished-import": [
      "error",
      {
        allowModules: ["vite", "@vitejs/plugin-react-refresh", "vite-plugin-linaria", "@linaria/*"],
      },
    ],
    "arrow-body-style": 0,
    "react/jsx-uses-react": 0,
    "react/react-in-jsx-scope": 0,
  },
};
