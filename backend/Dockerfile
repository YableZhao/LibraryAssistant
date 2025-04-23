FROM node:18-alpine

# 创建工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 创建日志和上传目录
RUN mkdir -p logs uploads

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["npm", "start"]
