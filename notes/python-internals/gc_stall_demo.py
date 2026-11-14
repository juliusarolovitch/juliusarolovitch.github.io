import gc
import json
import sys
import threading
import time


def run(freeze, heap_size=5_000_000, seconds=48.0):
    """Runs a heartbeat thread next to a growing heap and records every collection."""
    gc.collect()
    heap = [[i] for i in range(heap_size)]  # long-lived state, like a large import graph
    gc.collect()
    if freeze:
        gc.freeze()

    collections = []
    started = {}

    def on_gc(phase, info):
        if phase == "start":
            started["t"] = time.perf_counter()
        else:
            collections.append((started["t"], time.perf_counter(), info["generation"]))

    beats = []
    done = threading.Event()

    def heartbeat():
        while not done.is_set():
            beats.append(time.perf_counter())
            time.sleep(0.005)  # releases the GIL; waking up needs it back

    gc.callbacks.append(on_gc)
    thread = threading.Thread(target=heartbeat)
    t0 = time.perf_counter()
    thread.start()
    kept = []
    while time.perf_counter() - t0 < seconds:
        kept.extend([j] for j in range(50))  # slow growth of long-lived objects
        for _ in range(200):
            scratch = [[], {}]  # short-lived garbage, freed by reference counting
        time.sleep(0.001)
    done.set()
    thread.join()
    gc.callbacks.remove(on_gc)
    gc.unfreeze()
    del heap, kept
    gc.collect()

    gaps = [b - a for a, b in zip(beats, beats[1:])]
    full = [(a - t0, b - a) for a, b, g in collections if g == 2]
    print(f"freeze={freeze}: {len(collections)} collections, full passes at "
          + ", ".join(f"{t:.1f} s ({d * 1e3:.0f} ms)" for t, d in full)
          + f", longest heartbeat gap {max(gaps) * 1e3:.0f} ms")
    return {
        "beats": [round(b - t0, 5) for b in beats],
        "full": [[round(t, 4), round(d, 5)] for t, d in full],
        "young": len(collections) - len(full),
    }


if __name__ == "__main__":
    out = {"python": sys.version.split()[0], "runs": {"plain": run(False), "frozen": run(True)}}
    if len(sys.argv) > 1:
        with open(sys.argv[1], "w") as f:
            json.dump(out, f)
