export default {
  lang: "日本語",
  mosaicInfo: {
    title: "モザイク情報",
    id: "モザイクID",
    alias: "エイリアスネームスペース",
    divisibility: "可分性",
    address: "アドレス",
    supply: "相対量",
    revision: "リビジョン",
    height: "開始高",
    date: "日付",
    expired: "ブロック以内に期限切れ",
    supplyMutable: "供給可変",
    supplyImmutable: "供給変更不可",
    transferable: "転送可能",
    nonTransferable: "転送不可",
    restrictable: "制限可能",
    nonRestrictable: "制限不可",
    revokable: "取消可能",
    nonRevokable: "取消不可",
  },
  preview: {
    title: "タイトル",
    message: "メッセージ",
    fee: "手数料",
    feeDefault: "デフォルト",
    feeFast: "早い",
    feeAverage: "平均",
    feeSlow: "遅い",
    feeSlowest: "最遅",
    notice: "※ファイル選択後に書き込みデータの情報が表示されます。",
    info: "書き込みデータ情報",
    dataSize: "データサイズ",
    byte: "バイト",
    entire: "全体",
    predictFee: "合計手数料\n(予測値)",
  },
  networkTypes: {
    main: "メインネット",
    test: "テストネット",
  },
  home: {
    title: "EternalBookClient",
    explanation:
      "本ツールは Symbol ブロックチェーン上へのデータ書き込み、書き込んだデータの読み込みを行うためのツールです。",
    explanationList: [
      "データはモザイクに対して書き込まれます。",
      "自身が作成したモザイクに限り、既存のモザイクに対してデータを書き込むことも可能です。",
      "1つのモザイクに対し複数のデータを書き込むことが可能です。",
    ],
    info: "{kind}情報",
    infoDetail:
      "ただいまあるじとだーりんピが{cause}中につき、本ツールは利用できません。\nあるじとだーりんピが{until}まで、今しばらくお待ちください。",
    bug: {
      kind: "不具合",
      cause: "ケンカ",
      until: "仲直りする",
    },
    error: {
      kind: "エラー",
      cause: "がぶにゃん",
      until: "戻る",
    },
    maintainance: {
      kind: "メンテナンス",
      cause: "ごにょごにょ",
      until: "戻る",
    },
  },
  writer: {
    title: "データ書き込み",
    explanation:
      "Symbol ブロックチェーン上にデータを書き込みます。\nデータ書き込みと併せてモザイクの作成も可能です。",
    annotation: "署名方法を設定した後に書き込みが可能となります。",
    mosaicFlags: "モザイクフラグ",
    pleaseInputItem: "{item}を入力してください...",
    fileSelect: "ファイル選択",
    writeMode: "書き込みモード",
    modeCreate: "モザイクを作成して書き込み",
    modeRelated: "既存モザイクへの書き込み",
    createMosaic: "モザイク作成",
    writeOnChain: "オンチェーン書き込み",
    confirmTitle: "以下の内容で書き込みます。よろしいですか？",
  },
  viewer: {
    title: "ビューアー",
    explanation:
      "本ツールで書き込んだデータを読み込みます。\nブラウザ表示対応データの場合はブラウザ上に表示されます。",
    modeCreated: "作成モザイクから選択",
    modeOwned: "所有モザイクから選択",
    modeArbitrary: "モザイクを指定",
    readData: "データ読み込み",
    linkUrl: "リンクURL",
    errorTitle: "入力エラー",
    errorMessage: {
      mosaicIdInvalid: "モザイクIDが不正です。",
    },
  },
  settings: {
    title: "設定",
    explanation:
      "本ツールの設定を行います。\n書き込みを行う場合、まずは設定から署名方法を設定してください。\nデフォルトはSSSによる署名(サイズ制限あり)です。",
    selectOn: "オン",
    selectOff: "オフ",
    netType: "ネットワークタイプ",
    netTypeSupplement:
      "SSSを利用する場合はSSS連携されているアカウントのネットワークタイプとなります。",
    useSSS: "署名にSSSを利用する",
    useSSSSupplement:
      "SSSを利用することで秘密鍵を必要とせず署名できますが、本ツールでは連続して署名を行うため、SSSによる署名ができずに書き込み失敗する場合があります。",
    useSSSImportant:
      "確実にデータを書き込みたい場合、SSSを利用せずに秘密鍵による署名を行ってください。ただし、ご利用は自己責任で！",
    testMode: "テストモード",
    testModeSupplement:
      "本ツールの機能をテストするためのモードです。\nテストネットワークのアカウントを新規作成し、作成したアカウントでデータを書き込みます。",
    testModeImportant: "事前にフォーセットからXYMを取得する必要があります。",
    accessFaucet: "フォーセットへアクセス",
    secret: "秘密鍵",
    secretSSSOn: "SSSを利用する場合は秘密鍵の入力は不要です",
    secretSupplement: "SSSを利用しない場合は秘密鍵の入力が必須となります。",
    secretImportant: "入力された秘密鍵を本ツールで保存することはありません。",
    apply: "適用",
    errorTitle: "設定エラー",
    errorMessage: {
      networkTypeInvalid: "ネットワークタイプが不正です。",
      useSSSInvalid: "SSS連携されていないため、SSSによる署名は利用できません。",
      getFausetFailed: "テストモードの場合は先にフォーセットからXYMを取得してください。",
      privateKeyInvalid: "秘密鍵が不正です。",
    },
  },
  message: {
    loading: "読み込み中...",
    prepare: "準備中...",
    processing: "処理中...",
    lockSigning: "ハッシュロックTx署名待ち...",
    lockAnnounced: "ハッシュロックTx署名完了",
    lockUnconfirmed: "ハッシュロックTx承認待ち...",
    lockConfirmed: "ハッシュロックTx承認完了",
    txSigning: "書き込みTx署名待ち...",
    txAnnounced: "書き込みTx署名完了",
    txWaitCosign: "連署者の署名待ち...",
    txUnconfirmed: "書き込みTx承認待ち...",
    txConfirmed: "書き込みTx承認完了",
    complete: "書き込み完了",
    failed: "書き込み失敗",
  },
  modal: {
    close: "閉じる",
    ok: "OK",
    cancel: "キャンセル",
  },
};
