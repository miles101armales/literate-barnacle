import { Phone, MapPin } from "lucide-react"

export function ShopInfo() {
  return (
    <div className="mt-12 py-8 px-4 bg-black text-white rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Контакты</h2>

      <div className="space-y-4">
        <div className="flex items-start">
          <Phone className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-lg">Номер для связи:</p>
            <p className="text-lg">+7 (963) 142-70-81</p>
          </div>
        </div>

        <div className="flex items-start">
          <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-lg">Адрес:</p>
            <p className="text-lg">город Уфа, ул. Кирова 128к2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
