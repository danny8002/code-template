@echo on

echo Copying auth.cloud.json to auth.json...
copy /y ..\auth.cloud.json ..\auth.json
if %ERRORLEVEL% neq 0 goto error_copy_auth_json
echo OK

echo SUCCESS
exit /b 0

:error_copy_auth_json
echo FAILED: Copying auth.cloud.json to auth.json... 
exit /b -1

:error
echo FAILED
exit /b -1