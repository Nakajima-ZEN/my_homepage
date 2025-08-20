document.addEventListener('DOMContentLoaded', () => {
    // HTML要素の取得
    const ipInput = document.getElementById('ip-input');
    const searchBtn = document.getElementById('search-btn');
    const myIpBtn = document.getElementById('my-ip-btn');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results');

    // 結果表示用のspan要素
    const resIp = document.getElementById('res-ip');
    const resCountry = document.getElementById('res-country');
    const resRegion = document.getElementById('res-region');
    const resCity = document.getElementById('res-city');
    const resLat = document.getElementById('res-lat');
    const resLon = document.getElementById('res-lon');
    const resIsp = document.getElementById('res-isp');

    // Leaflet地図の初期化（グローバル変数で保持）
    let map = null;
    let marker = null;

    // 地図を初期化する関数
    function initMap() {
        if (map) return;
        map = L.map('map').setView([35.6895, 139.6917], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    // IP情報を取得して表示するメインの関数 (★APIを ipinfo.io に変更)
    async function getIpInfo(ipAddress = '') {
        loader.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        // ipinfo.io のAPI URLを構築
        const apiUrl = `https://ipinfo.io/${ipAddress}`;

        try {
            const response = await fetch(apiUrl);
            // ipinfo.ioはエラーでも200を返すことがあるので、レスポンスのステータスを確認
            if (!response.ok) {
                // IPアドレスの形式が不正などの場合
                throw new Error('情報の取得に失敗しました。IPアドレスまたはドメイン名を確認してください。');
            }
            const data = await response.json();

            displayInfo(data);

        } catch (error) {
            console.error('エラーが発生しました:', error);
            alert(error.message || 'ネットワークエラーまたはAPIリクエストに問題が発生しました。');
        } finally {
            loader.style.display = 'none';
        }
    }

    // 取得した情報をHTMLに表示し、地図を更新する関数 (★ipinfo.io のデータ形式に対応)
    function displayInfo(data) {
        // 緯度・経度は "loc" キーに "lat,lon" の形式で入っているため分割する
        const [lat, lon] = data.loc ? data.loc.split(',') : [null, null];

        // 情報を各span要素に設定
        resIp.textContent = data.ip || 'N/A';
        resCountry.textContent = data.country || 'N/A';
        resRegion.textContent = data.region || 'N/A';
        resCity.textContent = data.city || 'N/A';
        resLat.textContent = lat || 'N/A';
        resLon.textContent = lon || 'N/A';
        resIsp.textContent = data.org || 'N/A';

        resultsContainer.style.display = 'block';
        
        // 緯度経度が取得できた場合のみ地図を更新
        if (lat && lon) {
            const zoomLevel = 13;
            map.setView([lat, lon], zoomLevel);

            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker([lat, lon]).addTo(map);
            marker.bindPopup(`<b>${data.city || data.ip}</b>`).openPopup();
        } else {
             // 緯度経度が取得できない場合、地図をデフォルト表示に戻すなどの処理も可能
            console.warn("緯度・経度情報が取得できませんでした。");
        }
    }

    // イベントリスナーの設定
    searchBtn.addEventListener('click', () => {
        const ip = ipInput.value.trim();
        if (ip) {
            getIpInfo(ip);
        } else {
            alert('IPアドレスまたはドメイン名を入力してください。');
        }
    });

    ipInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    myIpBtn.addEventListener('click', () => {
        ipInput.value = '';
        getIpInfo(); // 引数なしで呼び出すと自分のIPを検索
    });

    // ページの読み込みが完了したら、地図を初期化し、ユーザーのIPで検索
    initMap();
    getIpInfo();
});
