# Use an official Node.js runtime as a parent image
USER root 
FROM node:18


# Install OpenJDK 17
RUN apt-get update && apt-get install -y openjdk-17-jdk

# Set JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Create and set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Update npm and install dependencies
RUN npm install -g npm@latest
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the server
CMD ["node", "server.js"]
