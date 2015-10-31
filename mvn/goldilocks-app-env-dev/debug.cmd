set CONFIG_DIR=%~dp0src\main\resources
set APP_JAR=%~dp0/target/goldilocks-app-env-dev-0.1.0.jar
set JAVA_DEBUG=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=9009

java %JAVA_DEBUG% -Dloader.path=%CONFIG_DIR%,lib/  -classpath %CONFIG_DIR%;%APP_JAR% org.springframework.boot.loader.PropertiesLauncher
pause