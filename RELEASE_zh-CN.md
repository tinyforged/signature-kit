[English](RELEASE.md) | 中文

# 发布指南

## 如何发布新版本

1. 打开 **Actions → Release** 工作流：https://github.com/TinyForged/signature-kit/actions/workflows/release.yml
2. 点击 **Run workflow**
3. 输入版本号（例如 `1.1.0`），遵循 [semver](https://semver.org/) 规范：
   - `MAJOR.MINOR.PATCH`（例如 `2.0.0`）
   - 预发布版本：`1.0.0-beta.1`
4. 点击 **Run workflow**

工作流将按顺序执行以下步骤：

```
install → build → test → bump versions → npm publish → commit → tag → create release
```

> **注意**：GitHub Release 和 git tag 仅在 npm 发布成功后才会创建。如果任何步骤失败，不会有任何提交或标签被创建。

## 发布内容

三个包始终以相同版本号一起发布：

| 包名 | Registry |
|---|---|
| `@tinyforged/signature-kit` | [npm](https://www.npmjs.com/package/@tinyforged/signature-kit) |
| `@tinyforged/signature-kit-react` | [npm](https://www.npmjs.com/package/@tinyforged/signature-kit-react) |
| `@tinyforged/signature-kit-vue` | [npm](https://www.npmjs.com/package/@tinyforged/signature-kit-vue) |

## 版本号更新规则

工作流会自动将所有三个 `package.json` 文件的版本号更新为指定版本，并更新内部依赖引用。发布后，版本号更新会以 `v*` 标签提交到 `main` 分支。

## 问题排查

### 发布失败，未创建 Release/Tag

这是预期行为。修复问题（例如构建错误、测试失败）后，使用相同版本号重新运行工作流即可。

### 需要重新发布相同版本

npm 不允许重新发布相同版本号。你需要升级到新版本（例如 `1.0.0` 失败则使用 `1.0.1`）。
