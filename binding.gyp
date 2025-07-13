{
  "targets": [
    {
      "target_name": "abletonlink",
      "sources": [ "src/abletonlink.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "link/include",
        "link/modules/asio-standalone/asio/include"
      ],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "cflags_cc": [ "-std=c++14" ],
      "defines": [ 
        "NAPI_DISABLE_CPP_EXCEPTIONS",
        "LINK_PLATFORM_MACOSX=1",
        "ASIO_STANDALONE=1"
      ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++14",
            "MACOSX_DEPLOYMENT_TARGET": "10.11",
            "OTHER_CFLAGS": [
              "-stdlib=libc++",
              "-mmacosx-version-min=10.11"
            ]
          },
          "defines": [ "LINK_PLATFORM_MACOSX=1" ]
        }],
        ["OS=='win'", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "AdditionalOptions": [ "/std:c++14" ]
            }
          },
          "defines": [ 
            "LINK_PLATFORM_WINDOWS=1",
            "_WIN32_WINNT=0x0601"
          ]
        }],
        ["OS=='linux'", {
          "cflags_cc": [ "-std=c++14", "-pthread" ],
          "ldflags": [ "-pthread" ],
          "defines": [ "LINK_PLATFORM_LINUX=1" ]
        }]
      ]
    }
  ]
}