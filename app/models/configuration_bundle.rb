class ConfigurationBundle < CouchRest::Model::Base
  use_database :configuration_bundle

  include PrimeroModel
  include Memoizable #Nothing to memoize but provides refresh infrastructure

  property :applied_by
  property :applied_at, DateTime, default: DateTime.now

  def self.import(model_data, applied_by=nil)
    Rails.logger.info "Starting configuration bundle import..."
    model_data.map do |model_name, data_arr|
      begin
        modelCls = model_name.constantize

        # CouchDB transactions are asynchronous.
        # That means that sometimes the server will receive a command to delete a record is yet to be deleted
        # that has yet to be created.
        database = modelCls.database
        while true
          docs_to_delete = database.all_docs['rows']
            .map{|d| {'_id' => d['id'], '_rev' => d['value']['rev']}}
            .reject{|d| d['_id'].start_with? '_design'}
          break if docs_to_delete.size == 0
          docs_to_delete.each do |doc|
            database.delete_doc doc
          end
        end

        database.bulk_save(data_arr, false, false)
      rescue NameError => e
        Rails.logger.error "Invalid model name in bundle import: #{model_name}"
        flash[:error] = "Invalid model name #{model_name}"
        redirect_to :action => :index, :controller => :users and return
      end
    end
    ConfigurationBundle.create! applied_by: applied_by
    Rails.logger.info "Successfully completed configuration bundle import."
  end


  #Although nothing is truly memoized on this class, changes to this will trigger a refresh
  #of the memoization cache for all metadata-type classes
  def self.memoized_dependencies
    CouchChanges::Processors::Notifier.supported_models
  end

  #Ducktyping to allow refreshing
  def self.flush_cache ; end

end