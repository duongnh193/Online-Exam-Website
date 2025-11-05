export const usageGuides = {
  student: [
    {
      title: 'Bat dau voi he thong',
      steps: [
        'Dang nhap bang tai khoan duoc cap',
        'Vao muc Exams de xem bai thi sap dien ra',
        'Kiem tra muc Results sau moi bai thi de theo doi tien do'
      ]
    },
    {
      title: 'Lam quen voi giao dien',
      steps: [
        'Thanh ben trai giup di chuyen giua Dashboard, Exams va Results',
        'Nut Theme o goc tren phai dung de chuyen che do sang toi sang',
        'Thong bao se hien o goc tren khi co lich thi moi hoac nhac nho'
      ]
    },
    {
      title: 'Khi gap kho khan',
      steps: [
        'Dung muc Huong dan trong dashboard de xem video huong dan',
        'Lien he giang vien neu khong vao duoc bai thi',
        'Su dung nut Support neu muon gui yeu cau ho tro'
      ]
    }
  ],
  lecturer: [
    {
      title: 'Thiet lap nhanh',
      steps: [
        'Vao Exams > Tao de de tao bai kiem tra moi',
        'Gan lop hoc tu muc Class va moi sinh vien',
        'Dat thoi gian mo va dong bai thi ro rang'
      ]
    },
    {
      title: 'Quan ly lop',
      steps: [
        'Su dung tab Class de xem thong ke si so va trang thai',
        'Ket hop Reports de xem diem trung binh theo lop',
        'Nho cap nhat noi dung lop trong muc Settings'
      ]
    },
    {
      title: 'Khi can ho tro',
      steps: [
        'Dung muc FAQ trong trang chu he thong',
        'Gui yeu cau cho bo phan ky thuat neu gap loi',
        'Lap ke hoach on tap bang cach tai chia se file huong dan'
      ]
    }
  ]
};

export const studentStudyTips = {
  outstandingThreshold: 8,
  warningThreshold: 6.5,
  defaultAdvice: [
    'Lap lich on tap theo tuan, uu tien mon co diem thap truoc',
    'Bo sung tai lieu tu muc Results > Class Results > View detail',
    'Chia nho muc tieu thanh cac buoc nho, danh gia lai moi tuan'
  ],
  lowScoreAdvice: [
    'On lai ghi chu cua lop va xem lai dap an mau trong Results',
    'Hoi giang vien ve phan gap kho hoac gap tro giang',
    'Tham gia nhom hoc chung de chia se kinh nghiem'
  ],
  highlightAdvice: [
    'Tiep tuc duoc phong do hien tai bang cach on dinh thoi gian hoc',
    'Co the ho tro ban cung lop bang cach chia se kinh nghiem',
    'Thu nghiem lam bai nang cao neu giang vien cung cap tai lieu'
  ]
};

export const lecturerQualityTips = {
  quickWins: [
    'Su dung muc Reports de xem lop co diem duoi trung binh va tao ke hoach bo tro',
    'Cap nhat ngan gon de cuong cho moi lop trong muc Class > View',
    'Giu trang Thai exam ro rang: Scheduled, Ongoing, Completed'
  ],
  questionBank: [
    'Sau moi ky thi, danh danh sach cau hoi co ty le sai cao de chinh sua',
    'Su dung spreadsheet chuan hoa muc tieu cua tung cau hoi',
    'Thuc hien review de bang cach doi giang vien trong bo mon'
  ],
  followUp: [
    'Gui thong bao tu Dashboard cho sinh vien co diem thap',
    'Tang cuong bu gioi thieu tai lieu on tap truoc cac bai thi lon',
    'Luu tru thong ke trong ngoai bang de so sanh qua cac ky'
  ]
};

export const websiteFaq = [
  {
    question: 'Toi tao hoac doi mat khau o dau?',
    answer: 'Vao Settings > Account > Change password, nhap mat khau cu va moi.'
  },
  {
    question: 'Lam sao de xem diem chi tiet?',
    answer: 'Sinh vien vao Results > Class Results > chon lop > View detail de xem tung bai.'
  },
  {
    question: 'Khong vao duoc bai thi?',
    answer: 'Kiem tra thoi gian mo bai, refresh lai trang, neu van gap loi thi lien he ho tro ky thuat.'
  }
];

export const fallbackMessages = {
  generic:
    'Toi chua hieu ro yeu cau. Ban co the thu cac tu khoa: "Goi y hoc tap", "Huong dan su dung", "Bao cao lop", hoac chon nut goi y ben tren.',
  missingScores:
    'Chua co du lieu diem de phan tich. Hay hoan thanh it nhat mot bai thi hoac kiem tra lai trang Results.'
};
