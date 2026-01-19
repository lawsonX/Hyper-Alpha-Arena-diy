#!/bin/bash

# 更新现有的软件包索引
sudo apt-get update

# 安装必要的包以允许apt通过HTTPS使用仓库
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker的官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定的存储库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新包索引
sudo apt-get update

# 安装最新版本的Docker CE和containerd
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# 启动并启用Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证Docker是否正确安装
sudo docker run hello-world


