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
        // すでに地図が存在する場合は処理を中断
        if (map) return; 

        // 地図を 'map' divに初期化し、ビューを設定
        map = L.map('map').setView([35.6895, 139.6917], 5); // 初期表示は東京、ズームレベル5

        // OpenStreetMapのタイルレイヤーを追加
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    // IP情報を取得して表示するメインの関数
    async function getIpInfo(ipAddress = '') {
        // ローダーを表示し、前回の結果を隠す
        loader.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        try {
            // ip-api.comから情報を取得
            const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,lat,lon,isp,query`);
            const data = await response.json();

            // APIからのレスポンスが成功した場合
            if (data.status === 'success') {
                displayInfo(data);
            } else {
                alert(`情報の取得に失敗しました: ${data.message}`);
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
            alert('ネットワークエラーまたはAPIリクエストに問題が発生しました。');
        } finally {
            // ローダーを非表示にする
            loader.style.display = 'none';
        }
    }

    // 取得した情報をHTMLに表示し、地図を更新する関数
    function displayInfo(data) {
        // 情報を各span要素に設定
        resIp.textContent = data.query;
        resCountry.textContent = data.country;
        resRegion.textContent = data.regionName;
        resCity.textContent = data.city;
        resLat.textContent = data.lat;
        resLon.textContent = data.lon;
        resIsp.textContent = data.isp;

        // 結果コンテナを表示
        resultsContainer.style.display = 'block';
        
        // 地図の中心を更新し、ズームイン
        const lat = data.lat;
        const lon = data.lon;
        const zoomLevel = 13; // 都市レベルのズーム

        map.setView([lat, lon], zoomLevel);

        // 既存のマーカーがあれば削除
        if (marker) {
            map.removeLayer(marker);
        }

        // 新しい位置にマーカーを設置
        marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<b>${data.city || data.query}</b>`).openPopup();
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

    // Enterキーでも検索できるようにする
    ipInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    myIpBtn.addEventListener('click', () => {
        ipInput.value = ''; // 入力欄をクリア
        getIpInfo(); // 引数なしで呼び出すと自分のIPを検索
    });

    // ページの読み込みが完了したら、地図を初期化し、ユーザーのIPで検索
    initMap();
    getIpInfo();
});
