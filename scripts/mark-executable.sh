if [ "$0" != "" ]; then
    chmod +x $0
    git update-index --add --chmod=+x $0
else
    printf "Please provide a path to the file you want to mark as executable."
fi