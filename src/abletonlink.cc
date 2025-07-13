#include "abletonlink.h"
#include <chrono>

Napi::FunctionReference AbletonLinkWrapper::constructor;

Napi::Object AbletonLinkWrapper::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "AbletonLink", {
        InstanceMethod("enable", &AbletonLinkWrapper::Enable),
        InstanceMethod("isEnabled", &AbletonLinkWrapper::IsEnabled),
        InstanceMethod("getTempo", &AbletonLinkWrapper::GetTempo),
        InstanceMethod("setTempo", &AbletonLinkWrapper::SetTempo),
        InstanceMethod("getBeat", &AbletonLinkWrapper::GetBeat),
        InstanceMethod("getPhase", &AbletonLinkWrapper::GetPhase),
        InstanceMethod("getNumPeers", &AbletonLinkWrapper::GetNumPeers),
        InstanceMethod("setIsPlaying", &AbletonLinkWrapper::SetIsPlaying),
        InstanceMethod("isPlaying", &AbletonLinkWrapper::IsPlaying),
        InstanceMethod("enableStartStopSync", &AbletonLinkWrapper::EnableStartStopSync),
        InstanceMethod("isStartStopSyncEnabled", &AbletonLinkWrapper::IsStartStopSyncEnabled),
        InstanceMethod("forceBeatAtTime", &AbletonLinkWrapper::ForceBeatAtTime),
        InstanceMethod("getTimeForBeat", &AbletonLinkWrapper::GetTimeForBeat),
        InstanceMethod("setNumPeersCallback", &AbletonLinkWrapper::SetNumPeersCallback),
        InstanceMethod("setTempoCallback", &AbletonLinkWrapper::SetTempoCallback),
        InstanceMethod("setStartStopCallback", &AbletonLinkWrapper::SetStartStopCallback),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("AbletonLink", func);
    return exports;
}

AbletonLinkWrapper::AbletonLinkWrapper(const Napi::CallbackInfo& info) 
    : Napi::ObjectWrap<AbletonLinkWrapper>(info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Initial tempo (number) expected").ThrowAsJavaScriptException();
        return;
    }

    double initialTempo = info[0].As<Napi::Number>().DoubleValue();
    link_ = std::make_unique<ableton::Link>(initialTempo);
}

Napi::Value AbletonLinkWrapper::Enable(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Boolean expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    bool enable = info[0].As<Napi::Boolean>().Value();
    link_->enable(enable);
    
    return env.Undefined();
}

Napi::Value AbletonLinkWrapper::IsEnabled(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, link_->isEnabled());
}

Napi::Value AbletonLinkWrapper::GetTempo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    auto sessionState = link_->captureAppSessionState();
    double tempo = sessionState.tempo();
    
    return Napi::Number::New(env, tempo);
}

void AbletonLinkWrapper::SetTempo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Tempo (number) expected").ThrowAsJavaScriptException();
        return;
    }

    double tempo = info[0].As<Napi::Number>().DoubleValue();
    
    auto sessionState = link_->captureAppSessionState();
    sessionState.setTempo(tempo, getCurrentTime());
    link_->commitAppSessionState(sessionState);
}

Napi::Value AbletonLinkWrapper::GetBeat(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    auto sessionState = link_->captureAppSessionState();
    double beat = sessionState.beatAtTime(getCurrentTime(), 1.0);
    
    return Napi::Number::New(env, beat);
}

Napi::Value AbletonLinkWrapper::GetPhase(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Quantum (number) expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    double quantum = info[0].As<Napi::Number>().DoubleValue();
    
    auto sessionState = link_->captureAppSessionState();
    double phase = sessionState.phaseAtTime(getCurrentTime(), quantum);
    
    return Napi::Number::New(env, phase);
}

Napi::Value AbletonLinkWrapper::GetNumPeers(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Number::New(env, static_cast<double>(link_->numPeers()));
}

void AbletonLinkWrapper::SetIsPlaying(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Playing state (boolean) expected").ThrowAsJavaScriptException();
        return;
    }

    bool isPlaying = info[0].As<Napi::Boolean>().Value();
    
    auto sessionState = link_->captureAppSessionState();
    sessionState.setIsPlaying(isPlaying, getCurrentTime());
    link_->commitAppSessionState(sessionState);
}

Napi::Value AbletonLinkWrapper::IsPlaying(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    auto sessionState = link_->captureAppSessionState();
    bool isPlaying = sessionState.isPlaying();
    
    return Napi::Boolean::New(env, isPlaying);
}

void AbletonLinkWrapper::EnableStartStopSync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsBoolean()) {
        Napi::TypeError::New(env, "Boolean expected").ThrowAsJavaScriptException();
        return;
    }

    bool enable = info[0].As<Napi::Boolean>().Value();
    link_->enableStartStopSync(enable);
}

Napi::Value AbletonLinkWrapper::IsStartStopSyncEnabled(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, link_->isStartStopSyncEnabled());
}

void AbletonLinkWrapper::ForceBeatAtTime(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber()) {
        Napi::TypeError::New(env, "Beat (number), time (number), and quantum (number) expected").ThrowAsJavaScriptException();
        return;
    }

    double beat = info[0].As<Napi::Number>().DoubleValue();
    double timeInSeconds = info[1].As<Napi::Number>().DoubleValue();
    double quantum = info[2].As<Napi::Number>().DoubleValue();
    
    auto time = std::chrono::microseconds(static_cast<long long>(timeInSeconds * 1000000.0));
    
    auto sessionState = link_->captureAppSessionState();
    sessionState.forceBeatAtTime(beat, time, quantum);
    link_->commitAppSessionState(sessionState);
}

Napi::Value AbletonLinkWrapper::GetTimeForBeat(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Beat (number) and quantum (number) expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    double beat = info[0].As<Napi::Number>().DoubleValue();
    double quantum = info[1].As<Napi::Number>().DoubleValue();
    
    auto sessionState = link_->captureAppSessionState();
    auto time = sessionState.timeAtBeat(beat, quantum);
    
    double timeInSeconds = static_cast<double>(time.count()) / 1000000.0;
    return Napi::Number::New(env, timeInSeconds);
}

std::chrono::microseconds AbletonLinkWrapper::getCurrentTime() const {
    return link_->clock().micros();
}

// Callback methods
void AbletonLinkWrapper::SetNumPeersCallback(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }
    
    std::lock_guard<std::mutex> lock(callbackMutex_);
    
    // Release any existing callback
    if (numPeersCallback_) {
        numPeersCallback_.Release();
    }
    
    // Create a thread-safe function
    numPeersCallback_ = Napi::ThreadSafeFunction::New(
        env,
        info[0].As<Napi::Function>(),
        "NumPeersCallback",
        0,
        1
    );
    
    // Set the callback on the Link instance
    link_->setNumPeersCallback([this](std::size_t numPeers) {
        handleNumPeersCallback(numPeers);
    });
}

void AbletonLinkWrapper::SetTempoCallback(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }
    
    std::lock_guard<std::mutex> lock(callbackMutex_);
    
    // Release any existing callback
    if (tempoCallback_) {
        tempoCallback_.Release();
    }
    
    // Create a thread-safe function
    tempoCallback_ = Napi::ThreadSafeFunction::New(
        env,
        info[0].As<Napi::Function>(),
        "TempoCallback",
        0,
        1
    );
    
    // Set the callback on the Link instance
    link_->setTempoCallback([this](double tempo) {
        handleTempoCallback(tempo);
    });
}

void AbletonLinkWrapper::SetStartStopCallback(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }
    
    std::lock_guard<std::mutex> lock(callbackMutex_);
    
    // Release any existing callback
    if (startStopCallback_) {
        startStopCallback_.Release();
    }
    
    // Create a thread-safe function
    startStopCallback_ = Napi::ThreadSafeFunction::New(
        env,
        info[0].As<Napi::Function>(),
        "StartStopCallback",
        0,
        1
    );
    
    // Set the callback on the Link instance
    link_->setStartStopCallback([this](bool isPlaying) {
        handleStartStopCallback(isPlaying);
    });
}

// Callback handlers
void AbletonLinkWrapper::handleNumPeersCallback(std::size_t numPeers) {
    std::lock_guard<std::mutex> lock(callbackMutex_);
    if (numPeersCallback_) {
        numPeersCallback_.BlockingCall([numPeers](Napi::Env env, Napi::Function callback) {
            callback.Call({Napi::Number::New(env, static_cast<double>(numPeers))});
        });
    }
}

void AbletonLinkWrapper::handleTempoCallback(double tempo) {
    std::lock_guard<std::mutex> lock(callbackMutex_);
    if (tempoCallback_) {
        tempoCallback_.BlockingCall([tempo](Napi::Env env, Napi::Function callback) {
            callback.Call({Napi::Number::New(env, tempo)});
        });
    }
}

void AbletonLinkWrapper::handleStartStopCallback(bool isPlaying) {
    std::lock_guard<std::mutex> lock(callbackMutex_);
    if (startStopCallback_) {
        startStopCallback_.BlockingCall([isPlaying](Napi::Env env, Napi::Function callback) {
            callback.Call({Napi::Boolean::New(env, isPlaying)});
        });
    }
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return AbletonLinkWrapper::Init(env, exports);
}

NODE_API_MODULE(abletonlink, Init)