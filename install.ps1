$latestsha="ce70828b6084f9ef532b8842ec2741490df81837"



echo " 










    ___  __    _         __       _    
  .' ..][  |  (_)       [  |     / |_  
 _| |_   | |  __   .--./)| |--. `| |-' 
'-| |-'  | | [  | / /'`\;| .-. | | |   
  | |    | |  | | \ \._//| | | | | |,  
 [___]  [___][___].',__`[___]|__]\__/     
                 ( ( __))            "

For ($i=0; $i -le 100; $i++) {
    Start-Sleep -Milliseconds 20
    Write-Progress -Activity "Installing..." -PercentComplete $i -CurrentOperation "Version: $latestsha"
    cd $HOME 
    mkdir bin/flight >$null 2>&1
    cd bin/flight 
    git clone http://github.com/flightpkg/flight.git . >$null 2>&1
    git checkout $latestsha >>$null 2>&1

}      

echo "Adding to PATH..." 
cd dist/js
Rename-Item -Path "cli-win.exe" -NewName "flight.exe" >$null 2>&1
Remove-Item -Path cli-linux -Force >$null 2>&1
Remove-Item -Path cli-macos -Force >$null 2>&1
set "PATH=$cd;$PATH">$null 2>&1
echo "Successfully installed flight." 

Read-Host -Prompt "Press enter to exit"
