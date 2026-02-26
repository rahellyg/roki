#!/usr/bin/env python3
import argparse
import json
import sys
import time

import requests


def build_payload():
    return {
        "details": {
            "fullName": "Test User",
            "phone": "0500000000",
            "email": "test@example.com",
            "productOffer": "Test",
            "tasks": "yes",
            "dna": "yes",
            "commitment": "5",
            "extraInfo": "render check",
            "approved": True,
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Test Roki send-email API")
    parser.add_argument(
        "--url",
        default="https://roki-api.onrender.com/api/send-email",
        help="Target API URL",
    )
    parser.add_argument(
        "--connect-timeout",
        type=float,
        default=10,
        help="Connection timeout in seconds",
    )
    parser.add_argument(
        "--read-timeout",
        type=float,
        default=70,
        help="Read timeout in seconds",
    )
    parser.add_argument(
        "--payload-file",
        help="Optional JSON file path to override default payload",
    )
    args = parser.parse_args()

    payload = build_payload()

    if args.payload_file:
        try:
            with open(args.payload_file, "r", encoding="utf-8") as file:
                payload = json.load(file)
        except Exception as error:
            print(f"Failed to load payload file: {error}")
            return 2

    print("POST", args.url)
    print("Timeouts:", {"connect": args.connect_timeout, "read": args.read_timeout})
    print("Payload:")
    print(json.dumps(payload, ensure_ascii=False, indent=2))

    start = time.time()

    try:
        response = requests.post(
            args.url,
            json=payload,
            timeout=(args.connect_timeout, args.read_timeout),
        )
    except requests.exceptions.ConnectTimeout:
        print("\nResult: CONNECT_TIMEOUT")
        return 3
    except requests.exceptions.ReadTimeout:
        print("\nResult: READ_TIMEOUT")
        return 4
    except requests.exceptions.RequestException as error:
        print(f"\nResult: REQUEST_FAILED ({type(error).__name__})")
        print(error)
        return 5

    elapsed = time.time() - start
    print(f"\nStatus: {response.status_code}")
    print(f"Elapsed: {elapsed:.3f}s")
    print("Response headers:")
    for key, value in response.headers.items():
        if key.lower() in {"date", "content-type", "x-render-origin-server", "cf-ray"}:
            print(f"  {key}: {value}")

    print("Response body:")
    print(response.text)

    if response.ok:
        print("\nResult: OK")
        return 0

    print("\nResult: API_ERROR")
    return 1


if __name__ == "__main__":
    sys.exit(main())
