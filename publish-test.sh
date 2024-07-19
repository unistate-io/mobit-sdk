#!/bin/bash
# 确保我们在正确的目录
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in the current directory."
  exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")

# 检查当前版本是否已经是测试版本
if [[ $CURRENT_VERSION =~ -test ]]; then
  # 提取当前测试版本的基础版本和时间戳
  BASE_VERSION=$(echo $CURRENT_VERSION | sed 's/-test.*//')c
  TIMESTAMP=$(echo $CURRENT_VERSION | sed 's/.*-test.//')
  # 创建一个新的测试版本
  NEW_VERSION="${BASE_VERSION}-test.$(date +%Y%m%d%H%M%S)"
else
  # 创建一个新的测试版本
  NEW_VERSION="${CURRENT_VERSION}-test.$(date +%Y%m%d%H%M%S)"
fi

# 更新 package.json 中的版本
npm version $NEW_VERSION --no-git-tag-version

# 发布测试版本
npm publish --tag test

echo "Published test version $NEW_VERSION"
