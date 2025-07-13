#ifndef ABLETONLINK_H
#define ABLETONLINK_H

#include <napi.h>
#include <ableton/Link.hpp>
#include <chrono>
#include <memory>

class AbletonLinkWrapper : public Napi::ObjectWrap<AbletonLinkWrapper> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    AbletonLinkWrapper(const Napi::CallbackInfo& info);

private:
    static Napi::FunctionReference constructor;
    
    // Link instance
    std::unique_ptr<ableton::Link> link_;
    
    // Methods
    Napi::Value Enable(const Napi::CallbackInfo& info);
    Napi::Value IsEnabled(const Napi::CallbackInfo& info);
    Napi::Value GetTempo(const Napi::CallbackInfo& info);
    void SetTempo(const Napi::CallbackInfo& info);
    Napi::Value GetBeat(const Napi::CallbackInfo& info);
    Napi::Value GetPhase(const Napi::CallbackInfo& info);
    Napi::Value GetNumPeers(const Napi::CallbackInfo& info);
    void SetIsPlaying(const Napi::CallbackInfo& info);
    Napi::Value IsPlaying(const Napi::CallbackInfo& info);
    void EnableStartStopSync(const Napi::CallbackInfo& info);
    Napi::Value IsStartStopSyncEnabled(const Napi::CallbackInfo& info);
    void ForceBeatAtTime(const Napi::CallbackInfo& info);
    Napi::Value GetTimeForBeat(const Napi::CallbackInfo& info);
    
    // Utility functions
    std::chrono::microseconds getCurrentTime() const;
};

#endif // ABLETONLINK_H