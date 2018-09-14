# sem-p1/wasm

wasm_compile_main() {
    local sub_path="$1"
    local target_file="$2"
    local target_file_path="$1/$2"
    local mode="$3";

    echo "--------------------"
    echo "sub_path: $sub_path"
    echo "target_file: $target_file"
    echo "target_file_path: $target_file_path"
    echo "mode: $mode"

    if [ "$mode" = "asmjs" ]; then
        local asm_path="/asmjs"
        local path=$sub_path$asm_path
        echo "path: $path"
        echo "--------------------"
        emcc $target_file_path -O3 -s WASM=0
    else
        local wasm_path="/wasm"
        local path=$sub_path$wasm_path
        echo "path: $path"
        echo "--------------------"
        emcc $target_file_path -O3 -s WASM=1 -s NO_EXIT_RUNTIME=1 -s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']"
    fi
}

wasm_compile_main $1 $2 $3