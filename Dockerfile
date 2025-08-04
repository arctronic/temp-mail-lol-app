# Use Ubuntu base image with Java and Node.js
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    openjdk-17-jdk \
    build-essential \
    python3 \
    python3-pip \
    file \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Create android sdk directory
RUN mkdir -p ${ANDROID_HOME}

# Download and install Android SDK Command Line Tools
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip /tmp/cmdline-tools.zip -d /tmp \
    && mkdir -p ${ANDROID_HOME}/cmdline-tools/latest \
    && mv /tmp/cmdline-tools/* ${ANDROID_HOME}/cmdline-tools/latest/ \
    && rm /tmp/cmdline-tools.zip

# Accept licenses and install Android SDK components
RUN yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --licenses \
    && ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "platforms;android-33" \
    "build-tools;34.0.0" \
    "build-tools;33.0.0" \
    "ndk;25.1.8937393"

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Set permissions for gradlew
RUN chmod +x android/gradlew

# Build the APK
RUN cd android && ./gradlew assembleDebug --no-daemon --stacktrace

# Create output directory
RUN mkdir -p /output

# Copy APK to output directory
RUN find android -name "*.apk" -exec cp {} /output/ \;

# List built APKs
RUN ls -la /output/