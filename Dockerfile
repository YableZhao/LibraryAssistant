FROM node:18-alpine

# 创建工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用nginx作为静态服务器
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /

# 设置脚本权限
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 设置自定义entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
